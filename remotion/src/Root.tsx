import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { MainVideoQuick } from "./MainVideoQuick";
import { MainVideoMerge } from "./MainVideoMerge";
import { MainVideoSelection } from "./MainVideoSelection";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="quick"
      component={MainVideoQuick}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="merge"
      component={MainVideoMerge}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="selection"
      component={MainVideoSelection}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);