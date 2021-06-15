
// Define custom schema for syncing avatar color, set by random-color, and name tag
NAF.schemas.add({
  template: '#avatar-template',
  components: [
    'position',
    'rotation',
   
    {
      selector: '.nametag',
      component: 'text',
      property: 'value'
    }
  ]
});