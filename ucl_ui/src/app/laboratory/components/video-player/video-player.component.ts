import { Component, OnInit, Input, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, AfterViewInit, OnChanges {
  
  @Input() videoSrc: string = '';

  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef;

  isLoading: boolean = true;
  isYouTubeVideo: boolean = true;
  youtubeVideoId: string = '';
  playerWidth: number = 640;
  playerHeight: number = 360;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.updatePlayerSize.bind(this));
  }

  ngAfterViewInit(): void {
    this.updatePlayerSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] && changes['videoSrc'].currentValue) {
      this.isYouTubeVideo = this.isYouTube(this.videoSrc);
      this.youtubeVideoId = this.getYouTubeId(this.videoSrc);

      console.log(this.videoSrc)
      
      // Esperar el siguiente ciclo de renderizado para asegurar que el contenedor existe
      setTimeout(() => {
        this.updatePlayerSize();
        this.cdRef.detectChanges(); // Forzar detección de cambios
      });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updatePlayerSize.bind(this));
  }

  updatePlayerSize(): void {
    if (this.videoContainer) {
      const containerWidth = this.videoContainer.nativeElement.clientWidth || 640;
      this.playerWidth = containerWidth;
      this.playerHeight = containerWidth * 9 / 16; // Mantener ratio 16:9
      this.cdRef.detectChanges(); 
    }
  }

  isYouTube(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYouTubeId(url: string): string {
    const match = url.match(/(?:\/|%3D|v=|vi=)([0-9A-Za-z_-]{11})(?:[%#?&]|$)/);
    return match ? match[1] : '';
  }

  onYouTubeReady(): void {
    this.isLoading = false;
  }
}
