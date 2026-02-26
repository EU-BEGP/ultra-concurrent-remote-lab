/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

export interface Laboratory {
    id?: string;
    name?: string;
    institution?: string;
    category?: string;
    description?: string;
    instructor: number;
    video?: any;
    youtube_video?:string;
    image?:any;
  }
  