import React, { Dispatch, SetStateAction, useState } from "react";
import { useUploadFile } from "../hooks/useUploadFile";
import { X } from "lucide-react";
import defaultImg from "../assets/images/imageUploader.png";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Loading from "./common/Loading";
import { useToast } from "./ui/use-toast";

const ImageUploader = ({
  images,
  setImages,
  isLoading,
}: {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  isLoading: boolean;
}) => {
  const { mutateAsync, isPending } = useUploadFile();
  const { toast } = useToast();
  const [newImage, setNewImage] = useState("");

  // remove image handler
  const handleRemoveImage = (img: string) => {
    if (images.length > 1) {
      const imageSelected = images.filter((image) => image !== img);
      console.log(imageSelected);
      setImages(imageSelected);
    } else {
      toast({
        title: "حداقل یک تصویر ضروری است",
        variant: "destructive",
      });
    }
  };

  // image uploader handler
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);

      if (selectedFiles.length > 3) {
        toast({
          title: "شما فقط می‌توانید حداکثر 3 تصویر انتخاب کنید",
          variant: "destructive",
        });
        return;
      }

      // ابتدا تعداد تصاویر انتخاب شده و تعداد تصاویر فعلی را با هم چک می‌کنیم
      if (images.length + selectedFiles.length > 6) {
        toast({
          title: "شما فقط می‌توانید حداکثر 6 تصویر انتخاب کنید",
          variant: "destructive",
        });
        return;
      }

      for (const file of selectedFiles) {
        const fileType = file.type.split("/")[0];

        if (fileType !== "image") {
          toast({
            title: "فقط میتوانید تصویر انتخاب کنید",
            variant: "destructive",
          });
          return;
        }

        const tempImageUrl = URL.createObjectURL(file);
        setNewImage(tempImageUrl);

        const formData = new FormData();
        formData.append("file", file);

        const uploadResult = await mutateAsync(formData);

        if (uploadResult?.location) {
          setImages((prevImages) => [...prevImages, uploadResult.location]);
        }

        setNewImage("");
      }
    }
  };

  // get image position
  const getImagePos = (img: string) =>
    images.findIndex((image) => image === img);

  // handle dragging
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setImages((imageList) => {
      const originalPos = getImagePos(active.id as string);
      const newPos = getImagePos(over.id as string);

      return arrayMove(imageList, originalPos, newPos);
    });
  };

  // sensor dnd-kit (mobile)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}>
      <div className='flex flex-col items-end'>
        {/* select image ==> input */}
        <div className='relative w-full h-36 mt-3 flex items-center justify-center mb-3 border rounded-md overflow-hidden'>
          <input
            type='file'
            id='image'
            multiple
            onChange={handleFileChange}
            className='absolute w-full h-full opacity-0 cursor-pointer'
            accept='image/*'
          />
          <img
            src={newImage || defaultImg}
            className='w-full h-full object-contain'
            alt='Selected preview'
          />
          {isPending ? (
            <>
              <span className='absolute z-10'>
                <Loading />
              </span>
              <div className='absolute w-full h-full bg-accent bg-opacity-70 opacity-55 flex items-center justify-center'></div>
            </>
          ) : null}
        </div>
        {/* image and image selected */}
        <div className='flex items-center flex-wrap justify-start gap-x-4 w-full'>
          <SortableContext
            items={images}
            strategy={horizontalListSortingStrategy}>
            {isLoading ? (
              <div className='w-full flex items-center justify-center'>
                <Loading />
              </div>
            ) : (
              images?.map((img) => (
                <ImageSorted
                  id={img}
                  image={img}
                  key={img}
                  handleRemoveImage={handleRemoveImage}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
};

export default ImageUploader;

const ImageSorted = ({
  id,
  image,
  handleRemoveImage,
}: {
  id: string;
  image: string;
  handleRemoveImage: (img: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className='relative w-20 h-20 my-2 rounded-md border overflow-hidden'>
      <div
        onClick={() => handleRemoveImage(image)}
        className='w-5 h-5 bg-black absolute flex items-center justify-center rounded-full m-1'>
        <X className='w-4' />
      </div>
      <img
        src={image}
        className='w-full h-full object-cover'
        alt={image}
      />
    </div>
  );
};
