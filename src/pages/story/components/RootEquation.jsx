import { Carousel } from "@mantine/carousel";
import clsx from "clsx";
import { useState } from "react";

export default function RootEquation(){
  const [isClicked, setIsClicked] = useState(false);

    return <Carousel.Slide className="flex flex-col gap-4 justify-center items-center">
        <p
        onClick={() => setIsClicked(true)}
        className={clsx(
            'font-gloria hover:text-gray-200 group text-6xl ease-in-out duration-200 cursor-pointer',
            {
            'text-gray-100 text-2xl': isClicked,
            }
        )}
        >
        f(x)=<span className="group-hover:text-black">x</span>^2-4=0
        </p>

        <p
        className={clsx('font-gloria text-gray-300 ease-in-out duration-200', {
            'opacity-0': !isClicked,
            'opacity-100 text-3xl': isClicked,
        })}
        >
        <span className="font-bold text-blue-400">x=2</span> is the root of equation
        </p>
    </Carousel.Slide>
}