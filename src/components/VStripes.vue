<template>
    <div 
        :class="[stripeContainerCls, initiallyAligned ? stripeContainerAlignCls : '']"
        :style="{'transform': `scale(${scaleFactor})`}"
    >
        <video
            v-if="motionType === 'camera'"
            ref="camera" 
            class="camera"
            autoplay
        ></video>
    </div>
</template>


<script>
    export default {
        name: 'VStripes',

        data() {
            return {
                image: null,
                stripeContainerCls: 'stripes',
                stripeContainerAlignCls: 'stripes--aligned',
                stripeCls: 'stripe',
                stripeMotionCls: 'stripe--in-motion',
                stripes: [],
                scaleFactor: 1,
                videoMotionDetection: {
                    threshold: 50,
                },
            }
        },

        props: {
            baseSrc: {
                type: String,
                required: true,
            },
            initiallyAligned: {
                type: Boolean,
                default: true,
            },
            fullWidth: {
                type: Boolean,
                default: true,
            },
            stripeOrientation: {
                type: String,
                default: 'portrait',
                validator: (orientation) => {
                    return ['landscape', 'portrait'].indexOf(orientation) !== -1;
                },
            },
            stripeSize: {
                type: Number,
                default: 10,
                validator: (size) => {
                    return size > 0;
                },
            },
            stripeGap: {
                type: Number,
                default: 0,
                validator: (gap) => {
                    return gap >= 0;
                },
            },
            stripeOffset: {
                type: Number,
                default: 100,
                validator: (offset) => {
                    return offset >= 0;
                },
            },
            motionType: {
                type: String,
                default: 'camera',
                validator: (motion) => {
                    return ['random', 'sequence', 'hover', 'camera'].indexOf(motion) !== -1;
                },
            },
            motionPulse: {
                type: Number,
                default: 10,
                validator: (pulse) => {
                    return pulse >= 0;
                },
            },
            motionDuration: {
                type: Number,
                default: 5,  // Ideally should sync with $durationIn (scss)
                validator: (duration) => {
                    return duration >= 0;
                },
            },
        },

        computed: {
            compSrc() {
                return require(`@/assets/${this.baseSrc}`);
            },

            compNumStripes() {
                return this.stripeOrientation === 'landscape' ?
                    Math.ceil(this.image.height / this.stripeSize) :
                    Math.ceil(this.image.width / this.stripeSize);
            },

            compCanvasSize() {
                return this.stripeOrientation === 'landscape' ? 
                    { width: this.image.width, height: this.stripeSize } :
                    { width: this.stripeSize, height: this.image.height };
            },

            compMediaConstraints() {
                return {
                    audio: false,
                    video: {
                        width: this.image.width, 
                        height: this.image.height,
                    },
                };
            },
        },

        mounted() {
            this.initImage();
        },

        methods: {
            initImage() {
                // Init image
                this.image = new Image();

                // Register event listener
                this.image.onload = () => {
                    this.updateScaleFactor();
                    this.drawStripes();
                    this.appendStripes();
                    this.setupMotion();
                }

                // Load image
                this.image.src = this.compSrc;
            },

            updateScaleFactor() {
                if (this.fullWidth) {
                    this.scaleFactor = this.stripeOrientation === 'landscape' ? 
                        Math.round(window.innerHeight / this.image.height) :
                        Math.round(window.innerWidth / this.image.width);
                }
            },

            drawStripes() {
                for (let i = 0; i < this.compNumStripes; i ++) {
                    let stripe = document.createElement('div');
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');
                    
                    this.setupCanvas(canvas, i);
                    this.drawStripe(context, i);
                    this.applyAttribuites(stripe);
                    this.applyStyles(stripe, i);
                    this.pushStripe(stripe, canvas);
                }
            },

            setupCanvas(canvas, stripeIndex) {
                canvas.width = this.compCanvasSize.width;
                canvas.height = this.compCanvasSize.height;

                if (stripeIndex === this.compNumStripes - 1) {
                    if (this.stripeOrientation === 'landscape') {
                        canvas.height = this.image.height - this.stripeSize * stripeIndex;
                    }
                    else {
                        canvas.width = this.image.width - this.stripeSize * stripeIndex;
                    }
                }
            },

            drawStripe(context, stripeIndex) {
                let drawParams = this.getDrawParams(stripeIndex);

                context.drawImage(
                    this.image, 
                    drawParams.source.x, drawParams.source.y, 
                    drawParams.source.width, drawParams.source.height, 
                    drawParams.destination.x, drawParams.destination.y, 
                    drawParams.destination.width, drawParams.destination.height
                );
            },

            getDrawParams(stripeIndex) {
                let params = {
                    source: {
                        x: 0,
                        y: stripeIndex * this.stripeSize,
                        width: this.image.width,
                        height: this.stripeSize,
                    },
                    destination: {
                        x: 0,
                        y: 0,
                        width: this.image.width,
                        height: this.stripeSize,
                    },
                };

                if (this.stripeOrientation !== 'landscape') {
                    params.source.x = stripeIndex * this.stripeSize;
                    params.source.y = 0;
                    params.source.width = this.stripeSize;
                    params.source.height = this.image.height;
                    params.destination.width = this.stripeSize;
                    params.destination.height = this.image.height;
                }

                return params;
            },

            applyAttribuites(stripe) {
                stripe.classList.add(
                    this.stripeCls, 

                    `${this.stripeCls}--${this.stripeOrientation}`
                );
            },

            applyStyles(stripe, stripeIndex) {
                if (this.stripeOrientation === 'landscape') {
                    // Offset
                    if (!this.initiallyAligned) {
                        if (stripeIndex % 2 === 0) {
                            stripe.style.marginLeft = `${this.stripeOffset / 2}px`;
                        }
                        else {
                            stripe.style.marginLeft = `-${this.stripeOffset / 2}px`;
                        }
                    }

                    // Gap
                    if (stripeIndex < this.compNumStripes - 1) {
                        stripe.style.marginBottom = `${this.stripeGap}px`;
                    }
                }
                else {
                    // Offset
                    if (!this.initiallyAligned) {
                        if (stripeIndex % 2 === 0) {
                            stripe.style.marginBottom = `${this.stripeOffset / 2}px`;
                        }
                        else {
                            stripe.style.marginBottom = `-${this.stripeOffset / 2}px`;
                        }
                    }

                    // Gap
                    if (stripeIndex < this.compNumStripes - 1) {
                        stripe.style.marginRight = `${this.stripeGap}px`;
                    }
                }
            },

            pushStripe(stripe, canvas) {
                stripe.appendChild(canvas);
                this.stripes.push(stripe);
            },

            appendStripes() {
                for (let i = 0; i < this.stripes.length; i ++) {
                    this.$el.appendChild(this.stripes[i]);
                }
            },

            setupMotion() {
                switch(this.motionType) {
                    case 'random':
                        this.initRandomMotion();
                        break;
                    case 'sequence':
                        this.initSequenceMotion();
                        break;
                    case 'hover':
                        this.initHoverMotion();
                        break;
                    case 'camera':
                        this.initCameraMotion();
                        break;
                    default:
                        this.initRandomMotion();
                }
                if (this.motionType === '') {
                    this.animateStripes();
                }
            },

            initRandomMotion() {
                requestAnimationFrame(() => {
                    this.startRandomMotion();
                });
            },

            startRandomMotion() {
                setTimeout(() => {
                    this.pulseRandomStripe();

                    requestAnimationFrame(() => {
                        this.startRandomMotion();
                    });
                }, this.motionPulse);
            },

            initSequenceMotion() {
                requestAnimationFrame(() => {
                    this.startSequenceMotion(0, true);
                });
            },

            startSequenceMotion(stripeIndex, isIncreasing) {
                setTimeout(() => {
                    this.pulseStripe(stripeIndex);

                    isIncreasing = isIncreasing ?
                        stripeIndex <= this.compNumStripes - 2 :
                        !stripeIndex >= 1;
                    stripeIndex = isIncreasing ? stripeIndex + 1 : stripeIndex - 1;

                    requestAnimationFrame(() => {
                        this.startSequenceMotion(stripeIndex, isIncreasing);
                    });
                }, this.motionPulse);
            },

            initHoverMotion() {
                for (let i = 0; i < this.stripes.length; i ++) {
                    this.stripes[i].addEventListener('mouseenter', () => {
                        this.stripes[i].classList.add(this.stripeMotionCls);
                    });

                    this.stripes[i].addEventListener('mouseleave', () => {
                        this.stripes[i].classList.remove(this.stripeMotionCls);
                    });
                }
            },

            initCameraMotion() {
                navigator.mediaDevices.getUserMedia(this.compMediaConstraints)
                    .then((stream) => {
                        let video = this.$refs.camera;
                        let videoCanvas = document.createElement('canvas');
                        let videoContext = videoCanvas.getContext('2d');
                        // this.$el.appendChild(videoCanvas);

                        this.setupVideoCapture(stream, video, videoCanvas, videoContext)
                        this.startVideoMotion(video, videoContext);
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.log(error);
                    });
            },

            setupVideoCapture(stream, video, videoCanvas) {
                video.srcObject = stream;
                videoCanvas.width = this.compMediaConstraints.video.width;
                videoCanvas.height = this.compMediaConstraints.video.height;
            },

            startVideoMotion(video, videoContext) {
                let prevFrame = [];

                setInterval(() => {
                    this.runVideoMotionDetector(
                        prevFrame, 
                        this.getVideoFrame(video, videoContext).data
                    );
                }, this.motionPulse);
            },

            runVideoMotionDetector(prevFrame, frameData) {
                for (let y = 0; y < this.compMediaConstraints.video.height; y += this.stripeSize) {
                    for (let x = 0; x < this.compMediaConstraints.video.width; x += this.stripeSize) {
                        let pos = (x + y * this.compMediaConstraints.video.width) * 4;
                        let red = frameData[pos];
                        // let green = frameData[pos + 1];
                        // let blue = frameData[pos + 2];

                        if (this.hasChangedVideoFrame(prevFrame, pos, red)) {
                            let stripeIndex = this.stripeOrientation === 'landscape' ?
                                Math.round(y / this.stripeSize) :
                                (this.compNumStripes - 1) - Math.round(x / this.stripeSize);
                            this.pulseStripe(stripeIndex);
                        }
                        
                        prevFrame[pos] = red;
                    }
                }
            },

            getVideoFrame(video, videoContext) {
                videoContext.drawImage(
                    video, 
                    0, 0, 
                    this.compMediaConstraints.video.width, this.compMediaConstraints.video.height
                );

                return videoContext.getImageData(
                    0, 0, 
                    this.compMediaConstraints.video.width, this.compMediaConstraints.video.height
                );
            },

            hasChangedVideoFrame(prevFrame, pos, red) {
                return prevFrame[pos] && 
                    Math.abs(prevFrame[pos] - red) > this.videoMotionDetection.threshold;
            },

            pulseRandomStripe() {
                this.pulseStripe(Math.floor(Math.random() * this.compNumStripes));
            },

            pulseStripe(stripeIndex) {
                this.stripes[stripeIndex].classList.add(this.stripeMotionCls);

                setTimeout(() => {
                    this.stripes[stripeIndex].classList.remove(this.stripeMotionCls);
                }, this.motionDuration);
            },
        },
    }
</script>


<style lang="scss">
    .stripes {
        $stripeOffset: 50px;

        &--aligned {

            .stripe--landscape {

                // &:nth-of-type(odd) {
                    
                //     &.stripe--in-motion {
                //         margin-left: -$stripeOffset !important;
                //     }
                // }

                // &:nth-of-type(even) {
                    
                    &.stripe--in-motion {
                        margin-left: $stripeOffset !important;
                    }
                // }
            }
            
            .stripe--portrait {

                // &:nth-of-type(odd) {
                    
                //     &.stripe--in-motion {
                //         margin-bottom: -$stripeOffset !important;
                //     }
                // }

                // &:nth-of-type(even) {
                    
                    &.stripe--in-motion {
                        margin-bottom: $stripeOffset !important;
                    }
                // }
            }
        }
    }

    .stripe {
        $root: &;
        $durationIn: 200ms;
        $delayOut: 400ms;
        $durationOut: $durationIn * 2;

        transition: margin $durationOut ease $delayOut;

        &--in-motion {
            transition: margin $durationIn ease;
        }

        &--landscape {

            &#{$root}--in-motion {
                margin-right: 0 !important;
                margin-left: 0 !important;
            }
        }

        &--portrait {
            display: inline-block;

            &#{$root}--in-motion {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }
        }

        canvas {
            display: block;
        }
    }

    .camera {
        display: none;
    }
</style>
