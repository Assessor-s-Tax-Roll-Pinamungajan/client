import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor() { }

  getAnislagUrl(): string {
    return `${this.baseUrl}/anislag`;
  }

  getAnislagByIdUrl(id: string): string {
    return `${this.baseUrl}/anislag/${id}`;
  }

  getAnislagIndexesUrl(): string {
    return `${this.baseUrl}/anislag/indexes`;
  }

  getAnislagBarangaysUrl(): string {
    return `${this.baseUrl}/anislag/barangays`;
  }

  getUsersUrl(): string {
    return `${this.baseUrl}/users`;
  }
}

