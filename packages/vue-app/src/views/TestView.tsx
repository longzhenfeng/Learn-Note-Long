import { Txt } from '../components/Txt';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TestView',
  setup() {
    const count = ref(0);
    return () => (
      <div>
        <button onClick={() => count.value++}>增加计数</button>
        <button onClick={() => count.value = 0}>重置计数</button>
        <button onClick={() => count.value--}>减少计数</button>
        <h1>Test View: {count.value}</h1>
        <Txt />
      </div>
    );
  },
});