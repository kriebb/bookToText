import 'reflect-metadata';
import configureDI from './containerRegistrationServices';
import { container } from 'tsyringe';
import { Program } from './program';




configureDI(); // Configure the DI container


 const program: Program =    container.resolve(Program);
 program.main().then(() => { console.log("finishing program main")});;


