import { defineComponent, ref } from "vue"

export const Txt = defineComponent({
  name: "Txt",
  setup() {
    const text = ref("")
    return () => (
      <form onSubmit={(e) => {
        e.preventDefault()
        alert(`Submitted: ${text.value}`)
      }}>
        <input
          type="text"
          placeholder="Please enter message!"
          value={text.value}
          onInput={(e: Event) => {
            text.value = (e.target as HTMLInputElement).value
          }}
        />
        <button type="submit">Submit</button>
      </form>
    )
  },
})
