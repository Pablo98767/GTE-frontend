import {
  Button
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import * as S from './styles';
import { userProps } from '@/utils/interfaces';
import { api } from '@/services/api';

import { useFormik } from 'formik';
import * as yup from 'yup';


import { Brand } from '@/components/Brand';
import { Input } from '@/components/Input';

import { theme } from '@/styles/theme';

import logo from '@/assets/images/bus_image.jpeg';

export function RegisterUser() {
  const navigate = useNavigate();

  const company = {
    name: 'gte_platform',
    logoUrl: logo,
    width: 50,
    height: 50,
  };

  const validationSchema = yup.object({
    name: yup
      .string()
      .required('É necessário inserir um nome'),
    email: yup
      .string()
      .email('Insira um email válido')
      .required('É necessário inserir um email'),
    password: yup
      .string()
      .min(6, 'A senha deve conter no mínimo 6 caracteres')
      .required('É necessário inserir uma senha'),
    password_confirmation: yup
      .string()
      .min(6, 'A senha deve conter no mínimo 6 caracteres')
      .required('É necessário inserir uma senha')
      .test('passwords-match', 'As senhas não coincidem', function(value) {
        return this.parent.password === value;
      }),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values: userProps) => {
      try {
        const response = await api.post(`/user/`, values);

        if (response.status !== 201) {
          alert('Erro ao cadastrar usuário');

          navigate('/signup');
        } else {
          alert('Usuário cadastrado com sucesso!');

          navigate('/');
        }
      } catch (error) {
        console.log(error);

        alert('Erro ao cadastrar usuário');

        navigate('/');
      }
    },
  });

  return (
    <S.Container >
      <S.Content>
        <S.BrandCard >
          <Brand style={{ fontSize: 37.243 }} company={ company } />
        </S.BrandCard>
        <S.FormCard >
          <S.Form
            onSubmit={formik.handleSubmit}
          >
            <h1
              style={{
                color: theme.gte_platform.light[100],
                fontSize: 32,
                fontWeight: 500,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Registro de Usuário
            </h1>
            <Input
              onChange={formik.handleChange}
              value={formik.values.name}
              fullWidth
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name?.toString()}
              autoFocus
              required
              id="name"
              label="Nome Completo"
              placeholder='Exemplo: Maria da Silva'
            />
            <Input
              onChange={formik.handleChange}
              value={formik.values.email}
              fullWidth
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email?.toString()}
              required
              id="email"
              label="Email"
              placeholder='Exemplo: exemplo@exemplo.com.br'
            />
            <Input
              onChange={formik.handleChange}
              value={formik.values.password}
              fullWidth
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              required
              id="password"
              label="Senha"
              type="password"
              placeholder='No mínimo 6 caracteres'
            />
            <Input
              onChange={formik.handleChange}
              value={formik.values.password_confirmation}
              fullWidth
              error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
              helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
              required
              id="password_confirmation"
              label="Confirme a senha"
              type="password"
              placeholder='No mínimo 6 caracteres'
            />
            <Button
              fullWidth
              size="large"
              variant="contained"
              type="submit"
              style={
                { 
                  backgroundColor: theme.gte_platform.tints.gold[100], 
                  textTransform: 'none',
                }
              }
            >
              Criar conta
            </Button>
            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={() => navigate('/')}
              style={
                { 
                  color: theme.gte_platform.light[100],
                  textTransform: 'none',
                }}
            >
              Cancelar
            </Button>
          </S.Form>
        </S.FormCard>
      </S.Content>
    </S.Container>
  );
}
