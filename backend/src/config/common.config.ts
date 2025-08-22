import { ConfigService, registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  pagination : {
    defaultRecord: 10,
  }
}));
