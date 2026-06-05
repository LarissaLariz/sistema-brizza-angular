import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Imoveis {
  private imoveisUrl = 'http://localhost:3000/imoveis';
  private reservasUrl = 'http://localhost:3000/reservas';

  constructor(private http: HttpClient) {}

  listarImoveis(): Observable<any[]> {
    return this.http.get<any[]>(this.imoveisUrl);
  }

  buscarImovelPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.imoveisUrl}/${id}`);
  }

  criarReserva(reserva: any): Observable<any> {
    return this.http.post<any>(this.reservasUrl, reserva);
  }
}