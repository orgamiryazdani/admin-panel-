import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useSignIn } from "../../../hooks/useUsers";
import { dataLoginType } from "../../../types/Auth";
import Loading from "../../common/Loading";
import { Eye, EyeOff } from "lucide-react";
import { memo, useState } from "react";
import { useAccount } from "../../../context/AccountProvider";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import { useToast } from "../../ui/use-toast";
import { usePageReloaded } from "../../../hooks/usePageReloaded";

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "وارد کردن ایمیل اجباری است",
    })
    .email({
      message: "فرمت ایمیل وارد شده صحیح نیست",
    }),
  password: z
    .string()
    .refine((val) => val.length > 0, {
      message: "وارد کردن رمز عبور اجباری است",
    })
    .refine((val) => val.length >= 4 || val.length === 0, {
      message: "رمز عبور باید حداقل ۴ حرف یا عدد باشد",
    }),
});

const SignInForm = () => {
  const { mutateAsync, isPending } = useSignIn();
  const [showPassword, setShowPassword] = useState(true);
  const { updateAccount, saveAccount, removeAccount } = useAccount();
  const isOnline = useNetworkStatus();
  const { toast } = useToast();
  const isReload = usePageReloaded();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: dataLoginType) => {
    if (!isOnline) {
      toast({
        title: "لطفا اتصال اینترنت خود را چک کنید",
      });
      return;
    }

   await updateAccount(data);
    try {
      await mutateAsync(data);
      saveAccount(data);
    } catch {
      removeAccount();
      console.log('ok');
      
    }
  };

  if (isPending && isReload) {
    removeAccount();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 mt-10 md:w-4/6 w-5/6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder='john@mail.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-center relative'>
                <FormControl className='mt-2'>
                  <Input
                    type={showPassword ? "password" : "text"}
                    placeholder='changeme'
                    {...field}
                  />
                </FormControl>
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className='h-8 top-3 w-10 [&>*]:w-5 absolute left-1 bg-background flex items-center justify-center cursor-pointer'>
                  {showPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          className='w-full text-lg'>
          {isPending ? (
            <Loading
              width='55'
              height='21'
            />
          ) : (
            "ورود"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default memo(SignInForm) ;
