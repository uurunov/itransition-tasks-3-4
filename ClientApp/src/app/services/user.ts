import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  status: number;
  lastLoginTime: string;
  createdAt: string;
}

@Service()
export class User {
  private http = inject(HttpClient);

  getUsers(search: string) {
    return this.http.get<UserDto[]>('/api/User/users', {
      params: { search },
    });
  }

  performToolbarAction(action: string, userIds: string[]) {
    return this.http.post(`api/User/${action}`, {
      userIds: action === 'delete-unverified' ? {} : userIds,
    });
  }
}
