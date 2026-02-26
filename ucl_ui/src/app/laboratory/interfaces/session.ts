/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

export interface Session {
    id?:string;
    user?: number | undefined;
    laboratory?: string;
    registration_date?:string;
    name?:string;
}
  