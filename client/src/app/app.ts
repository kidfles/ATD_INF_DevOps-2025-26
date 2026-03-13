import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <header>
        <h1>User Directory</h1>
        <p class="subtitle">Angular + DevOps Edition</p>
      </header>

      <div class="card">
        <div class="form-section">
          <h2>Add New User</h2>
          <div class="input-group">
            <input 
              [(ngModel)]="newName" 
              placeholder="Full name..." 
              (keyup.enter)="addUser()"
            />
            <button (click)="addUser()" [disabled]="!newName()">
              Add
            </button>
          </div>
        </div>

        <div class="list-section">
          <h2>Registered Users</h2>
          <div *ngIf="loading()" class="loader">Loading...</div>
          <ul *ngIf="!loading()">
            <li *ngFor="let user of users()">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-id">#{{ user._id?.substring(0, 8) }}</span>
            </li>
            <li *ngIf="users().length === 0 && !loading()" class="empty">
              No users found.
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      padding: 2rem;
    }
    .main-container {
      max-width: 600px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(to right, #818cf8, #34d399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .subtitle {
      color: #94a3b8;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    h2 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: #e2e8f0;
    }
    .input-group {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    input {
      flex: 1;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: white;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #6366f1;
    }
    button {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    button:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-1px);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 0.75rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-name {
      font-weight: 500;
    }
    .user-id {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .empty {
      color: #94a3b8;
      text-align: center;
      background: none;
    }
    .loader {
      text-align: center;
      color: #6366f1;
    }
  `],
})
export class App implements OnInit {
  private http = inject(HttpClient);
  
  protected users = signal<any[]>([]);
  protected loading = signal(false);
  protected newName = signal('');
  private apiUrl = environment.apiUrl;

  async ngOnInit() {
    this.loading.set(true);
    try {
      // Load config first
      const config: any = await this.http.get('./assets/config.json').toPromise();
      if (config && config.apiUrl) {
        this.apiUrl = config.apiUrl;
      }
      await this.loadUsers();
    } catch (e) {
      console.error('Failed to initialize app', e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadUsers() {
    const data: any = await this.http.get(`${this.apiUrl}/users`).toPromise();
    this.users.set(data);
  }

  async addUser() {
    if (!this.newName()) return;
    
    try {
      await this.http.post(`${this.apiUrl}/users`, { name: this.newName() }).toPromise();
      this.newName.set('');
      await this.loadUsers();
    } catch (e) {
      console.error('Failed to add user', e);
    }
  }
}
