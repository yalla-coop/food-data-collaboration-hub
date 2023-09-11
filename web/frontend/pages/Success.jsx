import { useEffect } from 'react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';

const Success = () => {
  const app = useAppBridge();

  useEffect(() => {
    setTimeout(() => {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, `/productslist`);
    }, 1000);
  }, []);

  return <div>Success</div>;
};

export default Success;
