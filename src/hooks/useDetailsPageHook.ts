import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";


type TMode = 'create' | 'edit'

export function useDetailsPageHook(){
    const location = useLocation()
    const [mode, setMode] = useState<TMode>()
    const [id, setId] = useState<string>()

    useEffect(()=>{
        const params = new URLSearchParams(location?.search)
        setMode(params.get('mode') as TMode)
        setId(params.get('id'))
    },[])

    const isCreateMode = mode === 'create'
    const isEditMode = mode === 'edit'

    return {
        isCreateMode,
        isEditMode,
        mode,
        id,
    }
}