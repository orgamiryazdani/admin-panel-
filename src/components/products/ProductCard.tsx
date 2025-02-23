import { Ellipsis, Trash } from "lucide-react";
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
import DrawerComponent from "../common/Drawer";
import AlertDialogComponent from "../common/AlertDialog";
import { useDeleteProduct } from "../../hooks/useProducts";
import Loading from "../common/Loading";
import { parseImages } from "../../utils/parseImages";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import noImage from "../../../public/images/no-image.webp";
import { lazy, Suspense } from "react";
const UpdateProduct = lazy(() => import("./UpdateProduct"));

const ProductCard = ({ item }: { item: product }) => {
  const { id, title, description, price, images, category } = item;

  const imagesParse = parseImages(images);

  const { mutateAsync, isPending } = useDeleteProduct();

  const [searchParams, setSearchParams] = useSearchParams();
  const productActive = searchParams.get("productactive") || 1;

  const activeProductHandler = async () => {
    await searchParams.set("productactive", id.toString());
    await setSearchParams(searchParams);
  };

  return (
    <Card
      className={`w-full min-w-72 max-h-32 flex
        ${isPersian(title) ? "rounded-r-2xl" : "rounded-l-2xl"}
         ${productActive == id && "bg-accent"}`}
      dir={isPersian(title) ? "rtl" : "ltr"}>
      {/* image */}
      <CardHeader
        onClick={activeProductHandler}
        className='md:w-52 w-32 p-0 cursor-pointer'>
        <Avatar className='rounded-none w-full h-full'>
          <AvatarImage
            src={imagesParse[0]}
            alt={title}
            className={`object-cover h-full w-full rounded-2xl ${
              productActive != id && "p-2"
            }`}
          />
          <AvatarFallback className='rounded-none bg-transparent relative'>
            <img
              src={noImage}
              alt='no image'
              className={`object-cover h-full w-full rounded-2xl ${
                productActive != id && "p-2"
              }`}
            />
            <span className='absolute text-accent-foreground text-xs bg-accent opacity-50 p-2 rounded-xl'>
              محصول بدون تصویر
            </span>
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      {/* title and description */}
      <CardContent
        onClick={activeProductHandler}
        className='w-2/4 p-3 pt-3 cursor-pointer'>
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
          <Suspense fallback='loading...'>
            <UpdateProduct
              id={id}
              title={title}
              description={description}
              price={price}
              images={images}
            />
          </Suspense>
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
