import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'pr-races',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class Races {}
