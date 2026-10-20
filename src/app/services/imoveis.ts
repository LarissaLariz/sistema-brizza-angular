
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Imoveis {
  private imoveisUrl = 'https://lofts-guaruja-api.onrender.com/imoveis';
  private reservasUrl = 'https://lofts-guaruja-api.onrender.com/reservas';
  private bloqueiosUrl = `${this.reservasUrl}/bloqueios`;

  constructor(private http: HttpClient) {}

  private obterCabecalhosAdmin(): HttpHeaders {
    const token = localStorage.getItem('tokenAdmin');

    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }

  listarImoveis(): Observable<any[]> {
    return this.http.get<any[]>(this.imoveisUrl);
  }

  buscarImovelPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.imoveisUrl}/${id}`);
  }

  criarImovel(imovel: any): Observable<any> {
    return this.http.post<any>(
      this.imoveisUrl,
      imovel,
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  atualizarImovel(id: number, imovel: any): Observable<any> {
    return this.http.put<any>(
      `${this.imoveisUrl}/${id}`,
      imovel,
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  removerImovel(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.imoveisUrl}/${id}`,
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  listarReservasPorImovel(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.reservasUrl}/imovel/${id}`,
    );
  }

  criarReserva(reserva: any): Observable<any> {
    return this.http.post<any>(this.reservasUrl, reserva);
  }

  listarReservas(): Observable<any[]> {
    return this.http.get<any[]>(
      this.reservasUrl,
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  atualizarStatusReserva(
    id: number,
    status: 'pendente' | 'pago' | 'cancelada',
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.reservasUrl}/${id}/status`,
      { status },
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  listarBloqueios(): Observable<any[]> {
    return this.http.get<any[]>(
      this.bloqueiosUrl,
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  criarBloqueio(bloqueio: {
    imovelId: number;
    dataEntrada: string;
    dataSaida: string;
    motivo: string;
  }): Observable<any> {
    return this.http.post<any>(
      this.bloqueiosUrl,
      bloqueio,
      { headers: this.obterCabecalhosAdmin() },
    );
  }

  removerBloqueio(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.bloqueiosUrl}/${id}`,
      { headers: this.obterCabecalhosAdmin() },
    );
  }
}
