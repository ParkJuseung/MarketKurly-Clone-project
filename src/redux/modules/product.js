/* eslint-disable */

import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { apis } from "../../shared/axios";

const GET_PRODUCT = "GET_PRODUCT";
const GET_BANNER = "GET_BANNER";
const GET_MY_PRODUCT = "GET_MY_PRODUCT";
const ADD_CART = "ADD_CART";
const GET_PRODUCT_FOR_INFINITY = "GET_PRODUCT_FOR_INFINITY";
const LOADING = "LOADING";

const DELETE_MY_PRODUCT = "DELETE_MY_PRODUCT";
const addCart = createAction(ADD_CART, data => ({ data }));
const getBanners = createAction(GET_BANNER, data => ({ data }));

const getProducts = createAction(GET_PRODUCT, data => ({ data }));
const getMyProducts = createAction(GET_MY_PRODUCT, data => ({ data }));
const deleteMyProducts = createAction(DELETE_MY_PRODUCT, id => ({ id }));
const getProductForInfinity = createAction(
  GET_PRODUCT_FOR_INFINITY,
  (products, paging) => ({
    products,
    paging,
  })
);
const isLoading = createAction(LOADING, loading => ({ loading }));

const initialState = {
  products: [],
  myProducts: [],
  numberOfElement: "",
  is_loaded: false,
  infinityProducts: [],
  paging: { start: null, next: null },
  is_loading: false,
};
//product 전체 호출
export const getProductAPI = () => {
  return function (dispatch, getState, { history }) {
    apis
      .getProduct()
      .then(res => {
        console.log(res);
        dispatch(getProducts(res.data.data));
      })
      .catch(err => console.log(err));
  };
};

// export const getBanner = () => {
//   return function (dispatch, getState, { history }) {
//     apis.getBanner().then((res) => {
//       console.log(res);
//     });
//   };
// };

export const getMyProductAPI = () => {
  return function (dispatch, getState, { history }) {
    apis.getCartProduct().then(res => {
      const products = res.data.data.products;
      dispatch(getMyProducts(products));
    });
  };
};

export const getProductForInfinityAPI = (_start = null) => {
  return function (dispatch, getState, { history }) {
    let _paging = getState().product.paging;
    console.log(_paging);
    dispatch(isLoading(true));
    let start = _start;

    if (_paging.start && !_paging.next) {
      return;
    }

    if (_start === null) {
      start = 1;
    }

    apis.getProduct(start).then(res => {
      const products = res.data.data.content;
      let paging = {
        start: _paging.next,
        next: _paging.next + 1,
      };
      console.log(paging);
      dispatch(getProductForInfinity(products, paging));
    });
  };
};

export const deleteMyProductAPI = id => {
  return function (dispatch, getState, { history }) {
    console.log(id);
    apis.RemoveCartProduct(id).then(res => {
      dispatch(deleteMyProducts(id));
    });
  };
};

export const addCartAPI = (productId, amount) => {
  return function (dispatch, getState, { history }) {
    const _cart = {
      productId: productId,
      amount: amount,
    };
    apis
      .AddProductToCart(_cart)
      .then(res => {
        console.log(" 장바구니 성공", res);
        window.alert(res.data.message);
      })
      .catch(err => {
        console.log(err.response);
      });
  };
};

export default handleActions(
  {
    [GET_PRODUCT]: (state, action) =>
      produce(state, draft => {
        draft.products = action.payload.data;
      }),
    [GET_MY_PRODUCT]: (state, action) =>
      produce(state, draft => {
        draft.myProducts = action.payload.data;
        draft.is_loaded = true;
      }),
    [DELETE_MY_PRODUCT]: (state, action) =>
      produce(state, draft => {
        draft.myProducts = draft.myProducts.filter(
          p => p.productId !== action.payload.id
        );
      }),
    [GET_PRODUCT_FOR_INFINITY]: (state, action) =>
      produce(state, draft => {
        draft.infinityProducts.push(...action.payload.products);
        draft.paging = action.payload.paging;
        draft.is_loading = false;
      }),
    [LOADING]: (state, action) =>
      produce(state, draft => {
        draft.is_loading = action.payload.loading;
      }),
  },
  initialState
);
const productActions = {
  getProductAPI,
  getMyProductAPI,
  deleteMyProductAPI,
  addCartAPI,
  getProductForInfinityAPI,
};
export { productActions };
