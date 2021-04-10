

export const displayMap =(locations)=>{
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWxhbWluLWF6YWQiLCJhIjoiY2tuMW4wOWs1MHo3NDJ1b2V4ZW55dDRqNyJ9.9Q405K-Q8_L4IZIDk3gTdA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/alamin-azad/ckn22d6w716gf17o1i10g4u4f',
  scrollZoom:false
  //   center:[-118.113491,34.111745],
  //   zoom:10,
  //   interactive:false
});
const bounds = new mapboxgl.LngLatBounds();
locations.forEach((loc) => {
  //Create marker
  const el = document.createElement('div');
  el.className = 'marker';
  //Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);
  //Add popup
  new mapboxgl.Popup({
    offset:30
  }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
  //Extends map bounds to include current location
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
}

