import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import proj4 from 'proj4';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private layers: L.Layer[] = [];

  ngOnInit(): void {
    this.initMap();
    this.loadQGISData();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Initialize the map centered on Philippines (adjust coordinates for your area)
    this.map = L.map('map').setView([10.26598,123.61165], 13); // Cebu coordinates - adjust as needed

    // Add Google Satellite tile layer
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google',
      maxZoom: 20
    }).addTo(this.map);

    // Fix Leaflet default icon issue
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private loadQGISData(): void {
    // Method 1: Load GeoJSON from a file in assets folder
    // Place your exported GeoJSON file in: client/src/assets/geojson/
    // Example: client/src/assets/geojson/qgis-data.geojson
    
    fetch('assets/geojson/qgis-data.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('GeoJSON file not found. Please export your QGIS data to GeoJSON and place it in assets/geojson/');
        }
        return response.json();
      })
      .then((geojson: any) => {
        // Transform coordinates from UTM to WGS84 if needed
        const transformedGeoJSON = this.transformGeoJSON(geojson);
        
        // Store original styles for each feature
        const originalStyles = new Map<L.Layer, any>();
        
        // Add GeoJSON layer to map
        const geojsonLayer = L.geoJSON(transformedGeoJSON, {
          style: (feature) => {
            // Customize style based on feature properties
            const style = {
              color: feature?.properties?.color || '#3388ff',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.3
            };
            return style;
          },
          onEachFeature: (feature, layer) => {
            // Store original style
            const originalStyle = {
              color: feature?.properties?.color || '#3388ff',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.3
            };
            originalStyles.set(layer, originalStyle);

            // Add popup with feature information
            if (feature.properties) {
              const props = feature.properties;
              let popupContent = '<div>';
              
              // Display all properties in popup
              if (props.Name) {
                popupContent += `<strong>Name:</strong> ${props.Name}<br>`;
              }
              if (props.Area) {
                popupContent += `<strong>Area:</strong> ${props.Area.toFixed(2)} sq.m.<br>`;
              }
              if (props.Index) {
                popupContent += `<strong>Index:</strong> ${props.Index}<br>`;
              }
              popupContent += '</div>';
              layer.bindPopup(popupContent);
            }

            // Add hover effects
            layer.on({
              mouseover: (e) => {
                const targetLayer = e.target;
                targetLayer.setStyle({
                  weight: 4,
                  color: '#ff6b6b',
                  fillOpacity: 0.6,
                  opacity: 1
                });
                
                // Change cursor to pointer
                if (!this.map.getContainer()) return;
                this.map.getContainer().style.cursor = 'pointer';
              },
              mouseout: (e) => {
                const targetLayer = e.target;
                const originalStyle = originalStyles.get(targetLayer);
                
                // Restore original style
                if (originalStyle) {
                  targetLayer.setStyle(originalStyle);
                }
                
                // Reset cursor
                if (this.map.getContainer()) {
                  this.map.getContainer().style.cursor = '';
                }
              }
            });

            // Add name label on each geometry
            if (feature.properties && feature.properties.Name) {
              const name = feature.properties.Name;
              
              // Calculate centroid for label placement
              let centroid: L.LatLng;
              if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                const bounds = (layer as L.Polygon | L.Polyline).getBounds();
                centroid = bounds.getCenter();
              } else {
                // For other geometry types (including MultiPolygon), try to get center
                const bounds = (layer as any).getBounds?.();
                if (bounds && bounds.getCenter) {
                  centroid = bounds.getCenter();
                } else {
                  return; // Skip if we can't determine center
                }
              }

              // Create a custom label div icon
              const labelDiv = L.divIcon({
                className: 'geojson-label',
                html: `<div style="
                  background-color: rgba(255, 255, 255, 0.9);
                  border: 2px solid #3388ff;
                  border-radius: 4px;
                  padding: 4px 8px;
                  font-weight: bold;
                  font-size: 12px;
                  color: #2e3b55;
                  white-space: nowrap;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  pointer-events: none;
                ">${name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
              });

              // Add label marker
              const labelMarker = L.marker(centroid, { icon: labelDiv, interactive: false });
              labelMarker.addTo(this.map);
            }
          }
        }).addTo(this.map);
        
        // Fit map to show all features
        this.map.fitBounds(geojsonLayer.getBounds());
        this.layers.push(geojsonLayer);
      })
      .catch(error => {
        console.warn('Could not load GeoJSON file:', error);
        console.log('To use QGIS data:');
        console.log('1. Export your QGIS layer as GeoJSON');
        console.log('2. Place it in: client/src/assets/geojson/qgis-data.geojson');
        console.log('3. Refresh the page');
      });

    // Method 2: Load multiple GeoJSON files
    // You can add more fetch calls here for multiple layers
  }

  // Method to load GeoJSON from API endpoint
  loadGeoJSONFromAPI(url: string): void {
    fetch(url)
      .then(response => response.json())
      .then((geojson: any) => {
        const layer = L.geoJSON(geojson).addTo(this.map);
        this.map.fitBounds(layer.getBounds());
        this.layers.push(layer);
      })
      .catch(error => console.error('Error loading GeoJSON from API:', error));
  }

  // Method to add GeoJSON data programmatically
  addGeoJSONData(geojson: any): void {
    const transformedGeoJSON = this.transformGeoJSON(geojson);
    const layer = L.geoJSON(transformedGeoJSON, {
      style: {
        color: '#3388ff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3
      }
    }).addTo(this.map);
    
    this.map.fitBounds(layer.getBounds());
    this.layers.push(layer);
  }

  // Transform GeoJSON coordinates from UTM (EPSG:32651) to WGS84 (EPSG:4326)
  private transformGeoJSON(geojson: any): any {
    // Check if coordinates need transformation (UTM Zone 51N - EPSG:32651)
    const needsTransform = geojson.crs?.properties?.name === 'urn:ogc:def:crs:EPSG::32651' ||
                          geojson.crs?.properties?.name?.includes('32651');
    
    if (!needsTransform) {
      return geojson; // Already in WGS84 or no CRS specified
    }

    // Define UTM Zone 51N projection (EPSG:32651)
    proj4.defs('EPSG:32651', '+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs');
    // WGS84 is already defined in proj4

    const transformCoordinates = (coords: any[]): any[] => {
      if (typeof coords[0] === 'number') {
        // Single coordinate pair [x, y]
        const [x, y] = coords;
        const transformed = proj4('EPSG:32651', 'EPSG:4326', [x, y]);
        return [transformed[0], transformed[1]];
      } else {
        // Array of coordinates
        return coords.map((coord: any) => transformCoordinates(coord));
      }
    };

    const transformGeometry = (geometry: any): any => {
      if (!geometry || !geometry.coordinates) {
        return geometry;
      }

      return {
        ...geometry,
        coordinates: transformCoordinates(geometry.coordinates)
      };
    };

    // Transform all features
    const transformedFeatures = geojson.features.map((feature: any) => ({
      ...feature,
      geometry: transformGeometry(feature.geometry)
    }));

    return {
      ...geojson,
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
      features: transformedFeatures
    };
  }
}
