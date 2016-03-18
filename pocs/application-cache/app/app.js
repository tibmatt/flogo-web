      indexImage = 1;

      document.getElementById('randomButton').addEventListener('click', function () {
      var image     = document.getElementById('logoImage');

      var imageName = document.getElementById('imageName');


        indexImage +=1;
        if(indexImage > 4) {
          indexImage = 1;
        }

        image.src = 'car-' + indexImage + '.png';
        imageName.innerHTML = image.src;
      });

      /*
      document.getElementById('clearAndReRegister').addEventListener('click', function () {

        caches.delete('dependencies-cache')
            .then(function () {
              alert('Cache was removed');
        })

        navigator.serviceWorker.getRegistration().then(function (registration) {
          registration.unregister();
          //window.location.reload();
        });
      });
      */





