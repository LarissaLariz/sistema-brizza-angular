import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Imoveis {
  private imoveisUrl = 'https://lofts-guaruja-api.onrender.com/imoveis';
private reservasUrl = 'https://lofts-guaruja-api.onrender.com/reservas';

  constructor(private http: HttpClient) {}

  listarImoveis(): Observable<any[]> {
    return this.http.get<any[]>(this.imoveisUrl);
  }

  buscarImovelPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.imoveisUrl}/${id}`);
  }

  criarImovel(imovel: any): Observable<any> {
    return this.http.post<any>(this.imoveisUrl, imovel);
  }

  atualizarImovel(id: number, imovel: any): Observable<any> {
    return this.http.put<any>(`${this.imoveisUrl}/${id}`, imovel);
  }

  removerImovel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.imoveisUrl}/${id}`);
  }

  listarReservasPorImovel(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.reservasUrl}/imovel/${id}`,
    );
  }

  criarReserva(reserva: any): Observable<any> {
    return this.http.post<any>(this.reservasUrl, reserva);
  }
}