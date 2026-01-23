import {ArrowLeft} from "lucide-react";
import {Button} from "../button";
import {useNavigate} from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();
  return (
    <Button variant="link" className="p-0 sticky" onClick={() => navigate(-1)}>
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  );
}
