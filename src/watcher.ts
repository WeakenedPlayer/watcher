import { FSWatcher, watch } from 'chokidar';
import { Observable, Subject } from 'rxjs';;
import { share } from 'rxjs/operators';

export interface WatcherOption {
    stabilityThreshold?: number;
    pollInterval?: number;
}

const defaultOption: WatcherOption = {
    stabilityThreshold: 2000, // ms
    pollInterval: 500 // ms
}

export class Watcher {
    private watcher: FSWatcher = null;

    // ------------------------------------------------------------------------
    // Subject
    // ------------------------------------------------------------------------
    private addSubject: Subject<string> = new Subject();
    private changeSubject: Subject<string> = new Subject();
    private unlinkSubject: Subject<string> = new Subject();
    private addDirSubject: Subject<string> = new Subject();
    private unlinkDirSubject: Subject<string> = new Subject();

    // ------------------------------------------------------------------------
    // Observable
    // ------------------------------------------------------------------------
    private _add$: Observable<string>;
    private _change$: Observable<string>;
    private _unlink$: Observable<string>;
    private _addDir$: Observable<string>;
    private _unlinkDir$: Observable<string>;

    // ------------------------------------------------------------------------
    // Getter
    // ------------------------------------------------------------------------
    get add$(): Observable<string> { return this._add$ }
    get change$(): Observable<string> { return this._change$ }
    get unlink$(): Observable<string> { return this._unlink$ }
    get addDir$(): Observable<string> { return this._addDir$ }
    get unlinkDir$(): Observable<string> { return this._unlinkDir$ }
    
    // ------------------------------------------------------------------------
    constructor() {
        this._add$ = this.addSubject.pipe( share() );
        this._change$ = this.changeSubject.pipe( share() );
        this._unlink$ = this.unlinkSubject.pipe( share() );
        this._addDir$ = this.addDirSubject.pipe( share() );
        this._unlinkDir$ = this.unlinkDirSubject.pipe( share() );
    }
    // ------------------------------------------------------------------------
    watch( path: string, option: WatcherOption = defaultOption ): Promise<void> {
        // merge all options
        let mergedOption = { ...defaultOption, ...option };
        this.unwatch();
        
        let watcher = watch( path, {
            ignoreInitial: true,
            followSymlinks: false,
            persistent: true,
            awaitWriteFinish: {
                stabilityThreshold: mergedOption.stabilityThreshold,
                pollInterval: mergedOption.pollInterval
              },
        } );

        return new Promise( ( resolve, reject ) => {
            watcher.once( 'ready', () => resolve() );  // initial scan finished
            watcher.on( 'add', ( src: string ) => this.addSubject.next( src ) );
            watcher.on( 'change', ( src: string ) => this.changeSubject.next( src ) );
            watcher.on( 'unlink', ( src: string ) => this.unlinkSubject.next( src ) );
            watcher.on( 'addDir', ( src: string ) => this.addDirSubject.next( src ) );
            watcher.on( 'unlinkDir', ( src: string ) => this.unlinkDirSubject.next( src ) );
            this.watcher = watcher;
        } );
        
    }
    
    unwatch(): void {
        if( this.watcher != null ) {
            // close old watcher
            this.watcher.close();
            this.watcher = null;
        }
    }
    
    remove( path: string ) {
        this.watcher.unwatch( path );      
    }

    add( path: string ) {
        this.watcher.add( path );
    }
}
