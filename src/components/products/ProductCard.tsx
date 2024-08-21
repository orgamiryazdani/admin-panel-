import { Edit, Ellipsis, Trash } from "lucide-react";
import { product } from "../../types/Product";
import { isPersian } from "../../utils/isPersian";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import truncateText from "../../utils/truncateText";
import { useSearchParams } from "react-router-dom";
import { queryClient } from "../../providers/AppProviders";
import DrawerComponent from "../common/Drawer";
import AlertDialogComponent from "../common/AlertDialog";
import { useDeleteProduct, useUpdateProduct } from "../../hooks/useProducts";
import Loading from "../common/Loading";
import DialogComponent from "../common/Dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { parseImages } from "../../utils/parseImages";
import { Textarea } from "../ui/textarea";
import ImageUploader from "../ImageUploader";

const ProductCard = ({ item }: { item: product }) => {
  const { id, title, description, price, images, category } = item;

  const imagesParse = parseImages(images);

  const { mutateAsync, isPending } = useDeleteProduct();
  const { mutateAsync: mutateUpdateProduct, isPending: updatePending } =
    useUpdateProduct();

  const [searchParams, setSearchParams] = useSearchParams();
  const productActive = searchParams.get("productactive") || 1;

  const activeProductHandler = async () => {
    await searchParams.set("productactive", id.toString());
    await setSearchParams(searchParams);
    queryClient.invalidateQueries({ queryKey: ["singleProduct"] });
  };

  return (
    <Card
      onClick={activeProductHandler}
      className={`w-full min-w-72 max-h-32 flex cursor-pointer
        ${isPersian(title) ? "rounded-r-2xl" : "rounded-l-2xl"}
         ${productActive == id && "bg-accent"}`}
      dir={isPersian(title) ? "rtl" : "ltr"}>
      {/* image */}
      <CardHeader className='md:w-52 w-32 p-0'>
        <img
          src={imagesParse[0]}
          alt='Photo by Drew Beamer'
          className={`object-cover h-full w-full rounded-2xl ${
            productActive != id && "p-2"
          }`}
        />
      </CardHeader>
      {/* title and description */}
      <CardContent className='w-2/4 p-3 pt-3'>
        <CardTitle className='text-[22px] h-8 overflow-hidden'>
          {truncateText(title, 26)}
        </CardTitle>
        <CardDescription className='mt-1 text-[13px] h-[60px] overflow-hidden'>
          {truncateText(description, 100)}
        </CardDescription>
      </CardContent>
      {/* other info */}
      <CardFooter className='flex justify-between w-1/4 px-2 flex-col items-end pb-2 pt-1'>
        {/* delete and edit */}
        <DrawerComponent
          trigger={<Ellipsis className='cursor-pointer' />}
          title={title}>
          {/* edit dialog */}
          <DialogComponent
            title='ویراش محصول'
            description={title}
            acceptBtn={updatePending ? <Loading width='80' /> : "ذخیره تغییرات"}
            onClick={() => {
              // mutateUpdateProduct({
              //   id: 8,
              //   title,
              //   price: 20,
              //   description:
              //   "Elevate your casual wardrobe with this timeless red baseball cap. Crafted from durable fabric, it fe",
              //   images: [
              //     "https://i.imgur.com/R3iobJA.jpeg",
              //     "https://i.imgur.com/Wv2KTsf.jpeg",
              //     "https://i.imgur.com/76HAxcA.jpeg",
              //   ],
              // })
            }}
            trigger={
              <div className='w-5/6 md:w-full flex items-center gap-x-2 h-10 p-2 rounded-md mt-5 mb-7 bg-accent text-accent-foreground cursor-pointer'>
                <Edit className='w-[22.5px]' />
                <span>ویراش محصول</span>
              </div>
            }>
            <div className='grid gap-4 py-4'>
              <ImageUploader />
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='title'
                  className='text-right'>
                  عنوان
                </Label>
                <Input
                  id='title'
                  defaultValue={title}
                  className='col-span-3'
                  placeholder='عنوان را وارد کنید'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='description'
                  className='text-right'>
                  توضیحات
                </Label>
                {/* <Input type='string' /> */}
                <Textarea
                  id='description'
                  className='col-span-3'
                  defaultValue={description}
                  placeholder='توضیحات را وارد کنید'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='price'
                  className='text-right'>
                  قیمت
                </Label>
                <Input
                  id='price'
                  type='number'
                  defaultValue={price}
                  className='col-span-3'
                  placeholder='قیمت را وارد کنید'
                />
              </div>
            </div>
          </DialogComponent>
          {/* delete Dialog */}
          <AlertDialogComponent
            acceptBtn={isPending ? <Loading width='30' /> : "بله"}
            title='آیا از حذف این محصول مطمعن هستید ؟'
            onClick={() => mutateAsync(id)}>
            <div className='w-5/6 md:w-full flex items-center gap-x-2 h-10 p-2 rounded-md mb-10 bg-rose-500 cursor-pointer'>
              <Trash className='w-[22.5px]' />
              <span>حذف محصول</span>
            </div>
          </AlertDialogComponent>
        </DrawerComponent>
        {/* price, category and option */}
        <div className='gap-y-1 flex flex-col items-end'>
          <p
            className={`text-sm text-green-500 px-1 flex gap-x-[2px] ${
              isPersian(title) && "flex-row-reverse"
            }`}>
            <span>$</span> {price}
          </p>
          <div
            dir='ltr'
            className='text-[9px] bg-primary-foreground rounded-md p-2 cursor-pointer'>
            # {truncateText(category.name, 20)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
