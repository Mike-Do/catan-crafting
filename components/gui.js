import GUI from 'lil-gui';

export function addGUI(state) {
    const gui = new GUI();

    gui.add( state, 'lookAt' , [0, 1, 2, 3, 4, 5, 6] );
    gui.add( state, 'autoRotate' );

    const weather = gui.addFolder( 'Weather' );
    weather.add( state, 'cloud' );
    weather.add( state, 'rain' );
    weather.add( state, 'lightning' );
    weather.add( state, 'fog' );

    const parameter = gui.addFolder( 'Parameters' );
    parameter.add( state, 'detail', 0, 5, 1 );
    parameter.add( state, 'reload' );
    
}