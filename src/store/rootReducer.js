import { combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import authReducer from "./slices/authSlice";
import childReducer from "./slices/childSlice";
import vacciReducer from "./slices/vaccinationSlice";
import productReducer from "./slices/productSlice";
import categoryReducer from "./slices/categorySlice";
import mediaReducer from "./slices/mediaSlice";
import milestoneReducer from "./slices/milestoneSlice";
import chatReducer from "./slices/chatSlice";
import messageReducer from "./slices/messageSlice";
import musicReducer from "./slices/musicSlice";
import favoriteReducer from "./slices/favoriteSlice";
import folderReducer from "./slices/folderSlice";
import growthReducer from "./slices/growthSlice";
import relationReducer from "./slices/relationSlice";
import cartReducer from "./slices/cartSlice";
import supplierReducer from "./slices/supplierSlice";
import orderReducer from "./slices/orderSlice";
import queryReducer from "./slices/querySlice";
import artistReducer from "./slices/artistSlice";
import activityReducer from "./slices/activitySlice";
import dashboardReducer from "./slices/dashboardSlice";
import reelReducer from "./slices/reelSlice";
import doctorReducer from "./slices/doctorSlice";
import babysitterReducer from "./slices/babysitterSlice";

// const authPersistConfig = {
//   key: "auth",
//   storage,
// };

const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "child", "favorite", "folder", "cart"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  child: childReducer,
  vaccination: vacciReducer,
  product: productReducer,
  category: categoryReducer,
  media: mediaReducer,
  milestone: milestoneReducer,
  chat: chatReducer,
  message: messageReducer,
  music: musicReducer,
  favorite: favoriteReducer,
  folder: folderReducer,
  growth: growthReducer,
  relation: relationReducer,
  cart: cartReducer,
  supplier: supplierReducer,
  order: orderReducer,
  query: queryReducer,
  artist: artistReducer,
  activity: activityReducer,
  dashboard: dashboardReducer,
  reel: reelReducer,
  doctor: doctorReducer,
  babysitter: babysitterReducer,
});

export default persistReducer(rootPersistConfig, rootReducer);
