<template>
	<div class="origam-list-children">
		<slot name="default">
			<template v-for="(item, index) in listItems">
				<slot
						name="children"
						v-bind="{item, index}"
				>
					<div
							:key="index"
							class="origam-list-children__item"
					>
						<slot
								v-if="hasDivider(item)"
								name="divider"
								v-bind="{ itemProps: item.props }"
						>
							<origam-divider v-bind="item.props"/>
						</slot>

						<slot
								v-else-if="hasSubheader(item)"
								name="subheader"
								v-bind="{ itemProps: item.props }"
						>
							<origam-list-subheader v-bind="item.props">
								<template
										v-if="hasSubheaderTitle"
										#default="{title}"
								>
									<slot
											name="subheaderTitle"
											v-bind="{title}"
									/>
								</template>
							</origam-list-subheader>
						</slot>

						<slot
								v-else-if="hasChildren(item)"
								name="group"
								v-bind="{ itemProps: item.props }"
						>
							<origam-list-group v-bind="item.props">
								<template
										v-if="hasGroupActivator"
										#activator="{props, isOpen, events, toggleIcon}"
								>
									<slot
											name="groupActivator"
											v-bind="{props, isOpen, events, toggleIcon}"
									/>
								</template>

								<template
										v-if="item.children"
										#items
								>
									<origam-list-children :items="item.children"/>
								</template>
							</origam-list-group>
						</slot>

						<slot
								v-else
								name="item"
								v-bind="{ itemProps: item.props }"
						>
							<origam-list-item v-bind="item.props"/>
						</slot>
					</div>
				</slot>
			</template>
		</slot>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, useSlots } from 'vue'
	import { OrigamDivider, OrigamListGroup, OrigamListItem, OrigamListSubheader } from '../../components'

	import { useCreateList, useProps } from '../../composables'

	import { LIST_ITEM_TYPE } from '../../enums'

	import type { IInternalListItemChildren, IListItemChildren } from '../../interfaces'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListItemChildren>(), {})

	const {filterProps} = useProps<IListItemChildren>(props)

	const slots = useSlots()

	useCreateList()

	const listItems = computed(() => {
		return props.items.map((item) => {
			return {children: item.children, props: item.props, type: item.type, raw: item}
		})
	})

	/*********************************************************
	 * Slots
	 ********************************************************/
	const hasSubheaderTitle = computed(() => {
		return slots.subheaderTitle
	})
	const hasGroupActivator = computed(() => {
		return slots.groupActivator
	})

	const hasDivider = (item: IInternalListItemChildren) => {
		return slots.divider || item.type === LIST_ITEM_TYPE.DIVIDER
	}
	const hasSubheader = (item: IInternalListItemChildren) => {
		return slots.subheader || item.type === LIST_ITEM_TYPE.SUBHEADER
	}
	const hasChildren = (item: IInternalListItemChildren) => {
		return item.children && item.children.length
	}

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>
