/*jshint esversion: 9 */
import Toy from './toy.vue';

export default {
  components: {
    Toy,
  },
  computed: {
    ...Vuex.mapGetters({
      toys: 'toyStore/getCachedToys',
    }),
  },
  mounted() {
    this.loadToys().then(async () => {
      if (!Array.isArray(this.toys) || this.toys.length === 0) {
        await this.importDemo();

        this.loadToys().then(() => {
          if (!Array.isArray(this.toys) || this.toys.length === 0)
            console.log('No toys data.');
        });
      }
    });
  },
  methods: {
    ...Vuex.mapActions({
      loadToys: 'toyStore/loadToys',
      importDemo: 'toyStore/importDemo',
    }),
  },
};
