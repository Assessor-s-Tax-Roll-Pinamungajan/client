import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:5556/api/users';
  constructor(private http: HttpClient) {}

  createUser(payload: { username: string; password: string }): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  verifyUser(payload: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify`, payload);
  }
}


