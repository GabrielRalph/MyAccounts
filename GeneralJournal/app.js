import {Icon} from "../SvgPlus/Icons.js"
import {SvgPlus, Vector} from "../3.5.js"
import {EntryForm} from "./EntryForm.js"
import {FireJournal} from "./FireJournal.js"
import {signIn, signOut, onUser, onLeave, syncUser, updateEntry} from "./FireUser.js"

let isMobile = false;
let body = new SvgPlus(document.body);
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
    body.class = "mobile"
    isMobile = true;
}

let form = new SvgPlus("form");
let filters = new SvgPlus("open-filter");
let add_entry = new SvgPlus("add-entry");
let signin = new SvgPlus("sign-in");
let journal_box = new SvgPlus("journal");

function hideButtons(bool){
  filters.styles = {display: bool ? "none" : ""}
  add_entry.styles = {display: bool ? "none" : ""}
}

function makeForm(e, journal) {
  if (e == null) e = {data:{}, key: null}

  let entryForm = new EntryForm(e.data);
  entryForm.accountNames = journal.accountNames;
  form.innerHTML = "";
  form.appendChild(entryForm);

  let cancel = form.createChild(Icon);
  cancel.icon = "cross";
  cancel.onclick = closeForm;



  let save = form.createChild(Icon);
  save.icon = "tick";
  save.styles = {opacity: 0};
  entryForm.onchange = () => {
    if(entryForm.hasChanged && entryForm.valid) {
      save.onclick = () => {
        updateEntry(e.key, entryForm.edit);
        closeForm();
      }
      save.styles = {opacity: 1};
    } else {
      save.onclick = null;
      save.styles = {opacity: 0};
    }
  }

  if (e.key != null) {
    let trash = form.createChild(Icon);
    trash.icon = "trash";
    trash.onclick = () => {
      updateEntry(e.key, null);
      closeForm();
    };
  }

  journal_box.styles = {
    "pointer-events": "none"
  };
  form.props = {
    style: {
      opacity: 1,
      "pointer-events": "all"
    }
  }
}
function closeForm() {
  form.styles = {
    opacity: 0,
    "pointer-events": "none"
  }
  journal_box.styles = {"pointer-events": "all"};
}

function addClickListener(el, listener) {
  if (isMobile) {
    let start = null;
    let end = null;
    el.ontouchstart = (e) => {
      let touch = e.touches[0];
      start = new Vector(touch.clientX, touch.clientY);
      end = start;
    }
    el.ontouchmove = (e) => {
      let touch = e.touches[0];
      end = new Vector(touch.clientX, touch.clientY);
    }
    el.ontouchend = (e) => {
      let dist = end.dist(start);
      if (dist < 150) {
        listener();
      }
    }
  } else {
    el.onclick = listener;
  }
}

onUser(() => {
  signin.innerHTML = "SIGN OUT";
  addClickListener(signin, signOut);

  let journal = new FireJournal();
  journal.onselect = (e) => {
    makeForm(e, journal);
  }

  add_entry.innerHTML = "ADD ENTRY";// createChild(Icon).icon = "add";
  addClickListener(add_entry, () => {
    makeForm(null, journal);
  })
  hideButtons(false);


  journal_box.innerHTML = "";
  journal_box.appendChild(journal);
  syncUser();
  console.log('user');
});

onLeave(() => {
  journal_box.innerHTML = "";
  signin.innerHTML = "sign in";
  addClickListener(signin, signIn);
  hideButtons(true);
})
