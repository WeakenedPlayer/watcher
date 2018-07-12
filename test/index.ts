import { Watcher } from '../dist';

let watcher = new Watcher();

watcher.add$.subscribe( path => console.log( '[Add]: ' + path ) );          // file added
watcher.change$.subscribe( path => console.log( '[Change]: ' + path ) );    // file changed
watcher.unlink$.subscribe( path => console.log( '[Unlink]: ' + path ) );    // file removed

watcher.watch( './tmp' ).then( () => {
    console.log( 'watching...' );
} );
