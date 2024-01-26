export default new Vuex.Store({
    state: {
        currentProduct: null,
        currentCategory: null,
    },
    mutations: {
        setCurrentProduct(state, currentProduct) {
            state.currentProduct = currentProduct;
        },
        setCurrentCategory(state, currentCategory) {
            state.currentCategory = currentCategory;
        },
    },
    actions: {
        updateCurrentProduct({ commit }, currentProduct) {
            commit('setCurrentProduct', currentProduct);
        },
        updateCurrentCategory({ commit }, currentCategory) {
            commit('setCurrentCategory', currentCategory);
        },
    },
    getters: {
        getCurrentProduct: (state) => state.currentProduct,
        getCurrentCategory: (state) => state.currentCategory,
    },
});