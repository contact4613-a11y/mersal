from pathlib import Path
import subprocess
import json

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'media'
OUT = ROOT / 'deliverables'
OUT.mkdir(exist_ok=True)
LOGO = ROOT / 'site/assets/logo.jpg'

def render(name, voice=None, duration=None):
    source = MEDIA / f'mersal-{name}-raw.mp4'
    portrait = name != 'overview'
    logo_width = 172 if portrait else 128
    margin = 52 if portrait else 42
    inputs = ['-i',str(source),'-i',str(LOGO)]
    logo_filter = f'[1:v]scale={logo_width}:-1,format=rgba[logo];'
    video_filter = '[0:v]fps=30,setsar=1'
    if name == 'reel-road':
        video_filter += ',tpad=stop_mode=clone:stop_duration=2'
    video_filter += f'[base];[base][logo]overlay={margin}:{margin}:shortest=0[v]'
    graph = logo_filter + video_filter
    audio_map = '0:a'
    if voice:
        inputs += ['-i',str(MEDIA / voice)]
        graph += ';[2:a]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=9,apad[voice]'
        if name == 'overview':
            # Retain clean dock ambience from the opening, not the garbled generated narration.
            graph += ';[0:a]atrim=0:3.1,asetpts=PTS-STARTPTS,volume=0.2,afade=t=out:st=2.5:d=0.6,apad[ambience]'
        else:
            graph += ';[0:a]volume=0.18,apad[ambience]'
        graph += ';[ambience][voice]amix=inputs=2:duration=longest:normalize=0[a]'
        audio_map = '[a]'
    cmd=['ffmpeg','-hide_banner','-loglevel','warning','-y',*inputs,'-filter_complex',graph,'-map','[v]','-map',audio_map,'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart']
    if duration: cmd += ['-t',str(duration)]
    else: cmd += ['-t','10.144']
    target=OUT/f'mersal-{name}.mp4'
    cmd += [str(target)]
    print('Rendering',target.name,flush=True)
    subprocess.run(cmd,check=True)
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height','-of','json',str(target)]))
    print(target.name,info,flush=True)
    return info

manifest={}
manifest['overview']=render('overview','overview-voice.wav',13)
manifest['reel-sea']=render('reel-sea')
manifest['reel-customs']=render('reel-customs')
manifest['reel-road']=render('reel-road','road-voice.wav',12)
(OUT/'media-verification.json').write_text(json.dumps(manifest,indent=2))
print('Final branded films complete.',flush=True)
