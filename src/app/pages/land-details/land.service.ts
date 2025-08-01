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
  return this.http.post<Lands[]>('http://localhost:5556/anislag',body)
}


update(id:number, body: Lands){ //using backtick instead of '' for hardcoding
  return this.http.patch<Lands[]>(`http://localhost:5556/anislag/${id}`,body)
}


delete(id: number){
  return this.http.delete<Lands[]>(`http://localhost:5556/anislag/${id}`)
}




}



