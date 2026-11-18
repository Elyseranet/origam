<script lang="ts">
	import { defineComponent, h } from 'vue'

	/*********************************************************
	 * OrigamListItemWrapper (#1249)
	 *
	 * @description
	 * Render function: returns the child as-is when there is no role, so no root is added around a flat row.
	 ********************************************************/
	export default defineComponent({
		name: 'OrigamListItemWrapper',
		props: {
			role: {type: String, default: undefined}
		},
		setup (props, {slots}) {
			return () => {
				const child = slots.default?.()

				return props.role ? h('div', {role: props.role, class: 'origam-list-item-wrapper'}, child) : child?.[0]
			}
		}
	})
</script>
