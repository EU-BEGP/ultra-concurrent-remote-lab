import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {

  @Input() videoSrc: string = '';

  isLoading: boolean = true;
  isYouTubeVideo: boolean = false;
  youtubeVideoId: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] && changes['videoSrc'].currentValue) {
      this.isYouTubeVideo = this.isYouTube(this.videoSrc);
      this.youtubeVideoId = this.getYouTubeId(this.videoSrc);
    }
  }


  isYouTube(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  // Función que extrae el ID del video de YouTube de la URL
  getYouTubeId(url: string): string {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:\/|%3D|v=|vi=)([0-9A-Za-z_-]{11})(?:[%#?&]|$)/);
    return videoIdMatch ? videoIdMatch[1] : '';
  }

  onYouTubeReady(): void {
    this.isLoading = false; // Ocultar loader cuando el video esté listo
  }

}
