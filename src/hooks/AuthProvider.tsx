import { createContext, useContext, useState, useEffect } from 'react';

import axios from 'axios';

import { api } from '../services/api';

import * as Utils from '../utils/interfaces';

export type AuthContextType = {
  signIn: (credentials: Utils.userProps) => void;
  signOut: () => void;
  user: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    birthday?: string;
    telephone?: [
      {
        id?: string;
        type?: string;
        number?: string;
      }
    ];
    message?: [
      {
        id?: string;
        title?: string;
        content?: string;
        type?: string;
      }
    ];
    deliveryAddress?: [
      {
        id?: string;
        street?: string;
        number?: string;
        complement?: string;
        sector?: string;
        city?: string;
        state?: string;
        country?: string;
        zipcode?: string;
        latitude?: string;
        longitude?: string;
      }
    ];
    userRestaurant?: [
      {
        id?: string;
        userId?: string;
        restaurantId?: string;
      }
    ];
    orders?: [
      {
        id?: string;
        createdAt?: string;
        updatedAt?: string;
        description?: string;
        status?: string;
        totalAmount?: string;
        userId?: string;
        restaurantId?: string;
        dishes?: [
          {
            id?: string;
            name?: string;
            price?: string;
            notes?: [
              {
                id?: string;
                content?: string;
                score?: string;
              }
            ]
          }
        ];
      }
    ];
    userFavoriteDishes?: [
      {
        id?: string;
        userId?: string;
        dishId?: string;
      },
    ];
    permissionGroup?: {
      id: string;
      role: string;
    };
    token?: string;
  };
  updateProfile: ({ userProfile, avatarFile }: Utils.updateUserProps) => void;
};

const AuthContext = createContext<AuthContextType>({
  signIn: () => {},
  signOut: () => {},
  user: {},
  updateProfile: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [data, setData] = useState({});

  const signIn = async ({ email, password }: Utils.userProps) => {
    try {
      const response = await api.post('/user/login', { email, password });
      const {
        categories,
        restaurants,
        currentUser,
        permissions,
        dishes,
        orders,
        tokenData,
      } = response.data;
console.log(dishes)
      const user = { ...currentUser, ...permissions[0] };
      const dishesList = dishes ?? [];

      localStorage.setItem(
        '@gte-platform-backend:categories',
        JSON.stringify(categories ? categories : [])
      );
      localStorage.setItem(
        '@gte-platform-backend:restaurants',
        JSON.stringify(restaurants ? restaurants : [])
      );
      localStorage.setItem(
        '@gte-platform-backend:dishes',
        JSON.stringify(dishesList ? dishesList : [])
      );
      localStorage.setItem(
        '@gte-platform-backend:orders',
        JSON.stringify(orders ? orders : [])
      );
      if (user.userFavoriteDishes) {
        const favoritesList: Utils.dishProps[] = user.userFavoriteDishes.map((item: Utils.favoriteDishProps) => {
          return dishesList.find((dish: Utils.dishProps) => dish.id === item.dishId);
        })
        localStorage.setItem('@gte-platform-backend:favorites', JSON.stringify(favoritesList ? favoritesList.filter((favorite) => favorite !== undefined) : []));
      }
      localStorage.setItem('@gte-platform-backend:token', tokenData.token);
      localStorage.setItem('@gte-platform-backend:user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = tokenData.token;
      setData({ ...user, token: tokenData.token });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.message);
      } else {
        alert('Não foi possível entrar');
      }
    }
  };

  const signOut = () => {
    localStorage.removeItem('@gte-platform-backend:categories');
    localStorage.removeItem('@gte-platform-backend:restaurants');
    localStorage.removeItem('@gte-platform-backend:dishes');
    localStorage.removeItem('@gte-platform-backend:orders');
    localStorage.removeItem('@gte-platform-backend:openOrder');
    localStorage.removeItem('@gte-platform-backend:editingDish');
    localStorage.removeItem('@gte-platform-backend:visualizedDish');
    localStorage.removeItem('@gte-platform-backend:restaurants');
    localStorage.removeItem('@gte-platform-backend:restaurant');
    localStorage.removeItem('@gte-platform-backend:permissions');
    localStorage.removeItem('@gte-platform-backend:token');
    localStorage.removeItem('@gte-platform-backend:users');
    localStorage.removeItem('@gte-platform-backend:user');
    localStorage.removeItem('@gte-platform-backend:favorites');

    setData('');
  };

  const updateProfile = async ({
    userProfile,
    avatarFile,
  }: Utils.updateUserProps) => {
    try {
      const token = localStorage.getItem('@gte-platform-backend:token');
      const user = localStorage.getItem('@gte-platform-backend:user');
      if (user) {
        const userInfo = JSON.parse(user);

        if (avatarFile) {
          const fileUploadForm = new FormData();
          fileUploadForm.append('avatar', avatarFile);

          const response = await api.patch(
            `/user/avatar/${userInfo.id}`,
            fileUploadForm
          );
          userInfo.avatar = response.data.avatar;
        }

        await api.put(`/user/${userInfo.id}`, userProfile);

        userInfo.name = userProfile.name ? userProfile.name : userInfo.name;
        userInfo.email = userProfile.email ? userProfile.email : userInfo.email;

        localStorage.setItem(
          '@gte-platform-backend:user',
          JSON.stringify(userInfo)
        );
        setData({ ...userInfo, token });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.message);
      } else {
        alert('Não foi possível entrar');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('@gte-platform-backend:token');
    const user = localStorage.getItem('@gte-platform-backend:user');
    if (user) {
      const userInfo = JSON.parse(user);

      if (token && user) {
        api.defaults.headers.common['Authorization'] = token;

        setData({ ...userInfo, token });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user: data,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export {
  AuthProvider,
  useAuth,
}