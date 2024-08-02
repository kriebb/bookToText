import 'reflect-metadata';
import configureDI from './ContainerRegistrationServices';
import { Program } from './Program';

async function run() {
    try {
        const program = configureDI().resolve(Program);
        await program.main();
        console.log("Finishing program main");
    } catch (error) {
        console.error(error);
    } finally {
        console.log("Program finished");
    }
}

// Execute the run function
run();