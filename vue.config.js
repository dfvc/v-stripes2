module.exports = {
    css: {
        loaderOptions: {
            sass: {
                data: `
                    @import "@/scss/normalize.scss";
                    @import "@/scss/_variables.scss";
                `
            }
        }
    }
  };
  