import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lands } from './land.interface';

@Injectable({
  providedIn: 'root'
})
export class LandService {

  constructor(private http: HttpClient) { }

  getAll()  {
    return this.http.get<Lands[]>('http://localhost:3000/post');
  }

  
create(body:Lands){
  return this.http.post<Lands[]>('http://192.168.8.8:5556/api/anislag',body)
}


update(id:number, body: Lands){ //using backtick instead of '' for hardcoding
  return this.http.patch<Lands[]>(`http://192.168.8.8:5556/api/anislag/${id}`,body)
}


delete(id: number){
  return this.http.delete<Lands[]>(`http://192.168.8.8:5556/api/anislag/${id}`)
}




}



