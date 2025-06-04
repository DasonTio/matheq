import clsx from "clsx";
import { useState, useEffect } from "react";
import { RangeSlider } from "@mantine/core";
import { Carousel } from "@mantine/carousel";

export default function ClosedMethod(){
    const [randomPosition, setRandomPosition] = useState(0);
    const [range, setRange] = useState([0, 100]);
    const [feedback, setFeedback] = useState('');
    const [color, setColor] = useState('gray');

    useEffect(() => {
        const target = Math.floor(Math.random() * 50 + 25); 
        setRandomPosition(target);
    }, []);

    const getFeedback = (guess) => {
        const diff = Math.abs(guess - randomPosition);
        if (diff < 10) {
        return ['🔥 Hot!', 'red'];
        } else if (diff < 25) {
        return ['🌤 Warm', 'orange'];
        } else {
        return ['❄️ Cold', 'blue'];
        }
    };

    const onSliderChange = (value) => {
        setRange(value);
        const [guess] = value;
        const [label, color] = getFeedback(guess);
        setFeedback(label);
        setColor(color);
    };

    return  <Carousel.Slide className="flex flex-col justify-center items-center gap-4">
          <div className="relative">
            <span className={clsx(`absolute transform -translate-x-1/2 -translate-y-1/2 h-32 w-0 border border-gray-300 border-dashed`)} style={{left: `${randomPosition}%`}}>
            
            </span>
            <RangeSlider
              color={color}
              className="w-md"
              value={range}
              onChange={onSliderChange}
              minRange={1}
              step={1}
              min={0}
              max={100}
              thumbLabel
            />
          </div>
          <div className="text-2xl font-semibold text-gray-700">{feedback}</div>
        </Carousel.Slide>
}