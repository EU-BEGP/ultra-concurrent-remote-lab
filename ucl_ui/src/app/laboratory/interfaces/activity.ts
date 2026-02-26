/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

export interface Activity {
    statement:string,
    expected_result?:string,
    result_unit?:string,
    laboratory?:string,
    experiment?:string
}
  