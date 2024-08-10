<template>
    <ul v-show="isOpen" class="context-menu" :style="{ left: `${left}px`, top: `${top}px` }">
        <slot></slot>
    </ul>
</template>

<script>
export default {
    data() {
        return {
            isOpen: false,
            left: 0,
            top: 0,
        };
    },
    methods: {
        open(event, item) {
            this.isOpen = true;
            this.left = event.pageX;
            this.top = event.pageY;
            this.$emit('item-selected', item);
        },
    },
};
</script>

<style scoped>
.context-menu {
    position: fixed;
    background-color: #333;
    color: #fff;
    padding: 8px 0;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    list-style-type: none;
    z-index: 999;
}

.context-menu li {
    padding: 8px 16px;
    cursor: pointer;
}

.context-menu li:hover {
    background-color: #444;
}
</style>