import {useState} from 'react';
import {getCatsApi, createCatApi} from '@/api/cat.api';
import {registerApi, loginApi} from '@/api/auth.api';

import('./testPageStyle.scss');

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (typeof error === 'object' && error !== null) {
    const appError = error as {response?: {data?: unknown}; message?: string};
    if (typeof appError.response?.data === 'string') {
      return appError.response.data;
    }

    if (typeof appError.message === 'string') {
      return appError.message;
    }
  }

  return fallbackMessage;
};

export function TestPage() {
  const [message, setMessage] = useState('');

  const getCats = async () => {
    try {
      const cats = await getCatsApi();
      setMessage(`Cats fetched: ${JSON.stringify(cats)}`);
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'An error occurred while fetching cats'));
    }
  };

  const register = async () => {
    try {
      const response = await registerApi({
        email: '2693986489@qq.com',
        password: '12345678',
      });
      setMessage(`Register success: ${String(Boolean(response))}`);
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'An error occurred during registration'));
    }
  };

  const login = async () => {
    try {
      const response = await loginApi({
        email: '2693986489@qq.com',
        password: '12345678',
      });
      setMessage(`Login success: ${String(Boolean(response))}`);
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'An error occurred during login'));
    }
  };

  const createCat = async () => {
    try {
      const newCat = await createCatApi({
        name: '豆包',
        age: 3,
        variety: '中华田园猫',
      });

      setMessage(`Cat created: ${newCat.name}`);
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'An error occurred while creating cat'));
    }
  };

  return (
    <div className="testPage">
      <button type="button" onClick={register}>
        {' '}
        注册{' '}
      </button>
      <button type="button" onClick={login}>
        {' '}
        登录{' '}
      </button>
      <button type="button" onClick={getCats}>
        {' '}
        获取所有cats{' '}
      </button>
      <button type="button" onClick={createCat}>
        {' '}
        创建Cat{' '}
      </button>
      <p>{message}</p>
    </div>
  );
}
