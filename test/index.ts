import { Watcher } from '../dist';

let watcher = new Watcher( './tmp' );

watcher.add$.subscribe( path => console.log( '[Add]: ' + path ) );          // file added
watcher.change$.subscribe( path => console.log( '[Change]: ' + path ) );    // file changed
watcher.unlink$.subscribe( path => console.log( '[Unlink]: ' + path ) );    // file removed

watcher.watch().then( () => {
    console.log( 'watching...' );
} );
