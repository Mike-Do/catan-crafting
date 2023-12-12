import GUI from 'lil-gui';

export function addGUI(state) {
    const gui = new GUI();

    gui.add( state, 'detail', 0, 5, 1 );

    gui.add( state, 'focus', { Hex0: 0, Normal: 1, Fast: 5 } );

    const weather = gui.addFolder( 'Weather' );
    weather.add( state, 'cloud' );
    weather.add( state, 'rain' );
    weather.add( state, 'lightning' );
    weather.add( state, 'fog' );

    gui.add( state, 'reload' );
    

}