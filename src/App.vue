<template>
    <div id="app">
        <section :class="[stripesCls, trim ? stripesTrimmedCls : '']">
            <v-stripes base-src="angry_wall_e.jpg" />
        </section>
    </div>
</template>

<script>
    import VStripes from './components/VStripes.vue'

    export default {
        name: 'app',

        components: {
            VStripes,
        },

        data() {
            return {
                stripesCls: 'stripes-container',
                stripesTrimmedCls: 'stripes-container--trimmed',
                trim: false,
            }
        },
    }
</script>


<style lang="scss">
    * {
        box-sizing: border-box;
    }

    body {
        background-color: $primary-light;
        font-family: sans-serif;
    }

    .stripes-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        overflow: hidden;
    }

    .stripes-container--trimmed {

        &:before {
            content: '';
            position: absolute;
            top: 0;
            width: 100%;
            height: 23%;
            background-color: $primary-light;
        }

        &:after {
            content: '';
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 23%;
            background-color: $primary-light;
        }
    }
</style>

