import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui';
import { initialsFromName } from '@/Layouts/Partials/navigation';
import { cn } from '@/lib/utils';

/** Foto atau inisial lawan bicara. `participant` = bentuk KontakResource. */
export default function ParticipantAvatar({ participant, className }) {
    return (
        <Avatar className={cn('size-11', className)}>
            {participant?.avatar_src && <AvatarImage src={participant.avatar_src} alt="" />}
            <AvatarFallback className="text-sm">{initialsFromName(participant?.name)}</AvatarFallback>
        </Avatar>
    );
}
